import React, { useState } from "react";
import crypto from "crypto";
import copy from "copy-to-clipboard";
import BN from "bn.js";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { useHistory } from "react-router";
import { gtag } from "@deptno/gtag";
import lockedCapsule from "../assets/capsule-locked-large.png";

import {
  createCapsule,
  getAssetLongValue,
  getTokenContract,
  tokenApproved,
} from "../services/contracthelper";
import { getPeriodSize, inputToDate } from "../services/dateHelper";
import { selectTokens } from "../state/tokenSlice";
import { Asset } from "../types/CapsuleType";
import Token from "../types/Token";
import Assets from "./Assets";
import TextInput from "./TextInput";
import Popup from "./Popup";
import { ValidationError } from "../styles/ValidationError";
import Selector from "./Selector";
import Dropdown from "./Dropdown";
import { getGlobals } from "../utils/globals";
import Button from "./Button";

type Approval = {
  asset: Asset;
  approved: boolean;
};

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ButtonContainer = styled.div`
  margin-top: 2rem;
  display: flex;

  button {
    margin: 0 1rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;

    button {
      margin: 1rem 0;
    }
  }
`;

type Props = {
  show: boolean;
  close: () => void;
};

const CreateCapsule = (props: Props): JSX.Element => {
  if (!props.show) return <></>;

  const history = useHistory();

  const ethAsset: Asset = { token: "ETH", value: "0" };
  const approval: Approval = { asset: ethAsset, approved: true };

  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [messagePasswordCopyState, setMessagePasswordCopyState] = useState(
    false
  );
  const [beneficiary, setBeneficiary] = useState("");
  const [message, setMessage] = useState("");
  const [distributionDate, setDistributionDate] = useState("");
  const [messagePassword, setMessagePassword] = useState("");
  const [periodType, setPeriodType] = useState("immediate");
  const [distributionFrequency, setDistributionFrequency] = useState("monthly");
  const [distributionPeriods, setDistributionPeriods] = useState("");
  const [distributionDateError, setDistributionDateError] = useState("");
  const [addingAssetsAllowed, setAddingAssetsAllowed] = useState("yes");
  const [addressError, setAddressError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [messageCopyError, setMessageCopyError] = useState("");
  const [distributionPeriodsError, setDistributionPeriodsError] = useState("");
  const [assets, setAssets] = useState<Asset[]>([ethAsset]);
  const [approvals, setApprovals] = useState<Approval[]>([approval]);

  const tokens = useSelector(selectTokens);

  const unapproved = approvals.filter((a: Approval) => !a.approved);

  const addressSymbol = (address: string) =>
    tokens.filter((token: Token) => token.address === address)[0].symbol;

  const updateApprovals = async (assets: Asset[]) => {
    const _approvals: Approval[] = [];
    const promises = assets.map(async (asset: Asset) => {
      _approvals.push({
        asset,
        approved: await tokenApproved(asset.token),
      });
    });
    await Promise.all(promises);
    setApprovals(_approvals);
  };

  const tokenApprove = async (address: string) => {
    const globals = await getGlobals();
    const tokenContract = await getTokenContract(address);
    tokenContract.methods
      .approve(globals.CAPSULE, new BN("9999999999999999999999999999"))
      .send()
      .on("transactionHash", (hash: any) => {
        setLoading(true);
      })
      .on("receipt", async (receipt: any) => {
        await updateApprovals(assets);
        setLoading(false);
      })
      .on("error", (err: any) => {
        console.log(`Error: ${err}`);
        setLoading(false);
      });
  };

  const aesEncrypt = (value: string, key: string): string => {
    if (value === "") return "";
    const encValue = escape(value);
    const cipher = crypto.createCipheriv(
      "aes-128-cbc",
      key.slice(0, 16),
      key.slice(16)
    );
    let crypted = cipher.update(encValue, "utf8", "hex");
    crypted += cipher.final("hex");
    return crypted;
  };

  const getMD5 = (value: string): string => {
    const hash = crypto.createHash("md5");
    hash.update(value);
    return hash.digest("hex"); // 7e1977739c748beac0c0fd14fd26a544
  };

  const create = async () => {
    if (!validate()) return;

    setLoading(true);

    const _assets: Asset[] = [];

    const promises: Promise<void>[] = assets.map(async (asset: Asset) => {
      _assets.push({
        token: asset.token,
        value: await getAssetLongValue(
          Number.parseFloat(asset.value),
          asset.token
        ),
      });
    });

    await Promise.all(promises);

    const date = inputToDate(distributionDate);
    const sigMsg = message === "" ? "" : "PF:".concat(message);
    const hashMsg = sigMsg === "" ? "" : getMD5(sigMsg).concat(message);
    const encMsg = aesEncrypt(hashMsg, messagePassword);

    await createCapsule(
      beneficiary,
      date,
      getPeriodSize(distributionFrequency),
      periodType === "immediate" ? 1 : Number(distributionPeriods),
      _assets,
      addingAssetsAllowed === "yes",
      encMsg
    );

    console.log("create:", encMsg);

    gtag("event", "created");
    gtag("event", "conversion");
    setComplete(true);
  };

  const isValid = (): boolean =>
    !addressError &&
    !distributionPeriodsError &&
    !distributionDateError &&
    !messageError &&
    !messageCopyError;

  const validate = (): boolean => {
    const dateValid = validateDate(distributionDate);
    const addressValid = validateAddress(beneficiary);
    const messageValid = validateMessage(message);
    const messagePasswordValid = validatePassword(messagePassword);
    const periodsValid =
      periodType === "immediate" ? true : validatePeriods(distributionPeriods);
    return (
      dateValid &&
      addressValid &&
      messageValid &&
      messagePasswordValid &&
      periodsValid
    );
  };

  const validateDate = (value: string): boolean => {
    try {
      const lDt = value.split(" ");
      const value_d = lDt[0];
      const items = value_d.split("/");
      const time = lDt.length > 1 ? lDt[1].split(":") : ["00", "00", "00"];
      const newDate = new Date(
        `${items[0]}/${items[1]}/${items[2]} ${time[0]}:${time[1]}:${time[2]}`
      );
      const now = new Date();
      if (items.length !== 3 || time.length !== 3)
        setDistributionDateError(
          "Incorrect Date format: " +
            `${items[0]}/${items[1]}/${items[2]} ${time[0]}:${time[1]}:${time[2]}`
        );
      else if (newDate < now)
        setDistributionDateError(
          "Date must be in future: " +
            `${items[0]}/${items[1]}/${items[2]} ${time[0]}:${time[1]}:${time[2]}`
        );
      else {
        setDistributionDateError("");
        return true;
      }
    } catch {
      setDistributionDateError("Incorrect Date format");
    }
    return false;
  };

  const validateAddress = (value: string): boolean => {
    if (value.length !== 42) setAddressError("Invalid Address");
    else {
      setAddressError("");
      return true;
    }
    return false;
  };

  const validateMessage = (value: string): boolean => {
    const encValue = escape(value);
    if (encValue.length > 100) setMessageError("Too Long");
    else if (unescape(encValue) !== value)
      setMessageError("Cannot be Encoded by Unicode");
    else {
      setMessageError("");
      return true;
    }
    return false;
  };

  const validatePassword = (value: string): boolean => {
    if (message.length > 0 && value.length !== 32)
      setMessageCopyError("Please Push the Copy Button Under the Message Box");
    else {
      setMessageCopyError("");
      return true;
    }
    return false;
  };

  const validatePeriods = (value: string): boolean => {
    let periods = 0;
    try {
      periods = Number(value);
      if (periods <= 0)
        setDistributionPeriodsError("Periods must be a positive number");
      else if (periods === 1)
        setDistributionPeriodsError(
          "For only one period, use an Immediate Capsule"
        );
      else {
        setDistributionPeriodsError("");
        return true;
      }
    } catch {
      setDistributionPeriodsError("Invalid Number");
    }
    return false;
  };

  const randomString = (len: number): string => {
    const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
    const maxPos = chars.length;
    let pwd = "";
    for (let i = 0; i < len; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  };

  const copyMessagePassword = (): boolean => {
    const currMessagePassword = randomString(32);
    setMessagePassword(currMessagePassword);
    if (copy(currMessagePassword)) {
      console.log("Password Copied");
      setMessagePasswordCopyState(true);
      validatePassword(currMessagePassword);
      return true;
    }
    setMessagePasswordCopyState(false);
    return false;
  };

  return (
    <>
      <Popup
        show={!complete}
        close={props.close}
        header="Create Vault"
        content={
          <Content>
            <Selector
              options={["immediate", "staggered"]}
              activeOption={periodType}
              setOption={(option: string) => {
                setPeriodType(option);
                setDistributionPeriodsError("");
              }}
              label="Distribution Type"
              tooltip="An Immediate Capsule will open completely on the distribution date, allowing all crypto to be accessed at once. A Staggered Capsule will first open on the Distribution Start Date for a portion of the crypto, and more crypto will become accessible at the defined intervals"
            />
            <TextInput
              label={
                periodType === "immediate"
                  ? "Distribution Date"
                  : "Distribution Start Date"
              }
              placeholder="yyyy/mm/dd HH:MM:SS"
              tooltip={
                periodType === "immediate"
                  ? "This is the date when the capsule will be able to be opened"
                  : "This is the date when the capsule will first be able to be opened"
              }
              value={distributionDate}
              setValue={(value: string) => {
                validateDate(value);
                setDistributionDate(value);
              }}
            />
            {distributionDateError && (
              <ValidationError>{distributionDateError}</ValidationError>
            )}
            {periodType === "staggered" && (
              <>
                <Dropdown
                  label="Distribution Frequency"
                  tooltip="How often the crypto should be distributed to the beneficiary after the capsule is opened"
                  options={["daily", "weekly", "monthly", "annually"]}
                  activeOption={distributionFrequency}
                  setOption={(option: string) =>
                    setDistributionFrequency(option)
                  }
                />
                <TextInput
                  label="Distribution Periods"
                  placeholder="e.g. 12"
                  tooltip="How many periods the crypto should be spread out over for the staggerd distribution"
                  value={distributionPeriods}
                  setValue={(value: string) => {
                    validatePeriods(value);
                    setDistributionPeriods(value);
                  }}
                />
                {distributionPeriodsError && (
                  <ValidationError>{distributionPeriodsError}</ValidationError>
                )}
              </>
            )}
            <TextInput
              label="Beneficiary"
              placeholder="e.g. 0x07d48BDBA7975f0DAF73BD5b85A2E3Ff87ffb24e"
              tooltip="This is the wallet address that your crypto will be sent to on the distribution date"
              value={beneficiary}
              setValue={(value: string) => {
                validateAddress(value);
                setBeneficiary(value);
              }}
            />
            {addressError && <ValidationError>{addressError}</ValidationError>}
            <TextInput
              label="Message"
              placeholder="Hello!"
              tooltip="This is the message you send to your beneficiary. It can only be seen after the Capsule is unlocked and the password below is input."
              value={message}
              setValue={(value: string) => {
                validateMessage(value);
                setMessage(value);
              }}
            />
            {messageError && <ValidationError>{messageError}</ValidationError>}
            {messageCopyError && (
              <ValidationError>{messageCopyError}</ValidationError>
            )}
            <ButtonContainer>
              <Button
                small
                disabled={message.length === 0}
                text={
                  message.length === 0
                    ? "No Message Attached"
                    : messagePasswordCopyState
                    ? "Message Password Copied"
                    : "Copy Message Password"
                }
                click={() => copyMessagePassword()}
              />
            </ButtonContainer>
            <Selector
              options={["yes", "no"]}
              activeOption={addingAssetsAllowed}
              setOption={(option: string) => setAddingAssetsAllowed(option)}
              label="Adding Assets Allowed"
              tooltip="Controls if you are able to continue to add assets to the capsule after it has been created. 'Yes' will mean you can keep adding assets after it has been created. 'No' means that you can only add assets once when it is created."
            />
            <Assets
              assets={assets}
              setAssets={(assets: Asset[]) => {
                setAssets(assets);
                updateApprovals(assets);
              }}
            />
          </Content>
        }
        buttonText={
          unapproved.length === 0
            ? "Create"
            : `Approve ${addressSymbol(unapproved[0].asset.token)}`
        }
        buttonAction={() => {
          if (unapproved.length === 0) create();
          else tokenApprove(unapproved[0].asset.token);
        }}
        loading={loading}
        buttonDisabled={!isValid()}
      />
      <Popup
        show={complete}
        close={props.close}
        header="Capsule Created!"
        image={lockedCapsule}
        body="Click below to view your capsule"
        buttonText="View Capsule"
        buttonAction={() => history.push("/sent")}
      />
    </>
  );
};

export default CreateCapsule;
