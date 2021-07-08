import React, { useState } from "react";
import crypto from "crypto";
import styled from "styled-components";
import { getCapsuleMessage } from "../services/contracthelper";
import { ValidationError } from "../styles/ValidationError";
import Popup from "./Popup";
import TextInput from "./TextInput";

const StyledUnlockMsg = styled.div`
  width: 100%;
`;

const MessageBox = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--sub);
  width: 50rem;
  word-wrap: break-word;
  white-space: normal;
`;

type Props = {
  show: boolean;
  close: () => void;
  capsuleId: number;
  // updateCapsules: () => void;
};

const unlockMsg = (props: Props): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [password, setPassword] = useState("");
  const [encMessage, setEncMessage] = useState("");
  const [rightPasswordFlag, setRightPasswordFlag] = useState(false);

  const validatePassword = (value: string): boolean => {
    if (value.length !== 32) setPasswordError("Please input 32-digit password");
    else {
      setPasswordError("");
      return true;
    }
    return false;
  };

  function aesDecrypt(crypted: string, key: string): string {
    if (crypted === "") return "";
    try {
      const decipher = crypto.createDecipheriv(
        "aes-128-cbc",
        key.slice(0, 16),
        key.slice(16)
      );
      let decrypted = decipher.update(crypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      const value = unescape(decrypted);
      return value;
    } catch (e) {
      console.log(e);
      return "E:";
    }
  }

  const getMD5 = (value: string): string => {
    const hash = crypto.createHash("md5");
    hash.update(value);
    return hash.digest("hex"); // 7e1977739c748beac0c0fd14fd26a544
  };

  const click = async () => {
    if (!validatePassword(password)) return;
    setLoading(true);
    const returnMessage = await getCapsuleMessage(props.capsuleId);
    const hashMessage = aesDecrypt(returnMessage, password);

    if (
      hashMessage.length > 32 &&
      hashMessage.slice(0, 32) === getMD5("PF:".concat(hashMessage.slice(32)))
    ) {
      setEncMessage(hashMessage.slice(32));
      setRightPasswordFlag(true);
      setPasswordError("");
    } else {
      setRightPasswordFlag(false);
      setPasswordError("Wrong Password");
      setPassword("");
    }
    setLoading(false);
    // props.close();
  };

  return (
    <Popup
      show={props.show}
      close={() => props.close()}
      header="Message"
      buttonText="Check"
      buttonAction={() => {
        click();
      }}
      secondButtonText="Close"
      secondButtonAction={() => {
        props.close();
      }}
      buttonDisabled={rightPasswordFlag}
      loading={loading}
      content={
        <StyledUnlockMsg>
          {!rightPasswordFlag && (
            <TextInput
              label="Input your password for the message"
              placeholder="32-digit Password"
              // tooltip="This is the password provided by the sender of the Capsule."
              value={password}
              setValue={(value: string) => {
                validatePassword(value);
                setPassword(value);
              }}
            />
          )}
          {passwordError && !rightPasswordFlag && (
            <ValidationError>{passwordError}</ValidationError>
          )}
          {encMessage !== "" && <MessageBox>{encMessage}</MessageBox>}
        </StyledUnlockMsg>
      }
    />
  );
};

export default unlockMsg;
