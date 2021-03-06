import React from "react";
import styled from "styled-components";
import Button from "./Button";

type ButtonType = {
  label: string;
  link: string;
};

const buttons: ButtonType[][] = [
  [
    // {
    //   label: "GitHub",
    //   link: "https://github.com/chase-manning/crypto-capsule",
    // },
    {
      label: "Contract",
      link:
        "https://rinkeby.etherscan.io/address/0xC0eDd76E6cb2a48C9980f224CA72df33D501f733",
    },
  ],
  [
    // {
    //   label: "Twitter",
    //   link: "https://twitter.com/crypto_capsule",
    // },
    // {
    //   label: "Discord",
    //   link: "https://discord.gg/K3svXV2y",
    // },
  ],
];

const StyledFooter = styled.div`
  width: 100%;
  height: 11rem;
  padding: 3.5rem 6rem;
  display: flex;
  justify-content: space-between;
  position: relative;

  @media (max-width: 600px) {
    padding: 2rem;
    height: 8rem;
  }
`;

const Section = styled.div`
  display: flex;

  button {
    margin: 0 1.5rem;
  }
`;

const Footer = (): JSX.Element => {
  return (
    <StyledFooter>
      {buttons.map((section: ButtonType[], index: number) => (
        <Section key={index}>
          {section.map((button: ButtonType) => (
            <Button
              key={button.label}
              small
              text={button.label}
              click={() => (window as any).open(button.link, "_blank").focus()}
            />
          ))}
        </Section>
      ))}
    </StyledFooter>
  );
};

export default Footer;
