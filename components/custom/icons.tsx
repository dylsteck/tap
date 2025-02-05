/* eslint-disable @next/next/no-img-element */
import baseImg from "@/public/images/base-icon.png";
import bountycasterImg from "@/public/images/bountycaster-icon.png";
import clankerImg from "@/public/images/clanker-icon.png";
import icebreakerImg from "@/public/images/icebreaker-icon.png";

export const ArrowUpIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width={size}
      style={{ color: "currentcolor" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.70711 1.39644C8.31659 1.00592 7.68342 1.00592 7.2929 1.39644L2.21968 6.46966L1.68935 6.99999L2.75001 8.06065L3.28034 7.53032L7.25001 3.56065V14.25V15H8.75001V14.25V3.56065L12.7197 7.53032L13.25 8.06065L14.3107 6.99999L13.7803 6.46966L8.70711 1.39644Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

export const BaseIcon = ({ size = 15 }) => {
  return (
    <img alt="base Icon" className="rounded-full" src={baseImg.src} style={{ width: `${size}px`, height: `${size}px` }} />
  );
};

export const BountycasterIcon = ({ size = 15 }) => {
  return (
    <img alt="Bountycaster Icon" src={bountycasterImg.src} style={{ width: `${size}px`, height: `${size}px` }} />
  );
};

export const ClankerIcon = ({ size = 15 }) => {
  return (
    <img alt="Clanker Icon" src={clankerImg.src} style={{ width: `${size}px`, height: `${size}px` }} />
  );
};

export const FarcasterIcon = ({ theme = "light" }: { theme?: "light" | "dark" }) => {
  const fillColor = theme === "light" ? "white" : "black";

  return (
    <svg
      width="1000"
      height="1000"
      viewBox="0 0 1000 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z"
        fill={fillColor}
      />
      <path
        d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"
        fill={fillColor}
      />
      <path
        d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z"
        fill={fillColor}
      />
    </svg>
  );
};

export const IcebreakerIcon = ({ size = 15 }) => {
  return (
    <img alt="Icebreaker Icon" className="rounded-full" src={icebreakerImg.src} style={{ width: `${size}px`, height: `${size}px` }} />
  );
};

export const HeartIcon = ({ size = 16 }: { size: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 18 18"
      fill="none"
    >
      <path
        d="M9 16.0312L9.38813 16.7805C9.26819 16.8426 9.13508 16.8751 9 16.8751C8.86492 16.8751 8.73182 16.8426 8.61188 16.7805L8.60287 16.776L8.58263 16.7648C8.46482 16.7039 8.34853 16.6401 8.23387 16.5735C6.86271 15.7931 5.56911 14.8838 4.37063 13.8577C2.30062 12.0724 0 9.39375 0 6.1875C0 3.1905 2.34675 1.125 4.78125 1.125C6.52163 1.125 8.04712 2.02725 9 3.3975C9.95288 2.02725 11.4784 1.125 13.2188 1.125C15.6532 1.125 18 3.1905 18 6.1875C18 9.39375 15.6994 12.0724 13.6294 13.8577C12.3293 14.9693 10.9178 15.9434 9.41738 16.7648L9.39712 16.776L9.39038 16.7794H9.38813L9 16.0312ZM4.78125 2.8125C3.27825 2.8125 1.6875 4.122 1.6875 6.1875C1.6875 8.60625 3.465 10.8495 5.47312 12.5798C6.56874 13.5169 7.74949 14.3496 9 15.0671C10.2505 14.3496 11.4313 13.5169 12.5269 12.5798C14.535 10.8495 16.3125 8.60625 16.3125 6.1875C16.3125 4.122 14.7218 2.8125 13.2188 2.8125C11.6741 2.8125 10.2836 3.92175 9.81112 5.5755C9.76137 5.75232 9.6552 5.90804 9.50877 6.01895C9.36235 6.12986 9.18369 6.18989 9 6.18989C8.81631 6.18989 8.63765 6.12986 8.49123 6.01895C8.3448 5.90804 8.23863 5.75232 8.18888 5.5755C7.71637 3.92175 6.32587 2.8125 4.78125 2.8125Z"
        fill="#9FA3AF"
      ></path>
    </svg>
  );
};

export const LoaderIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width={size}
      style={{ color: "currentcolor" }}
    >
      <g clipPath="url(#clip0_2393_1490)">
        <path d="M8 0V4" stroke="currentColor" strokeWidth="1.5"></path>
        <path
          opacity="0.5"
          d="M8 16V12"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.9"
          d="M3.29773 1.52783L5.64887 4.7639"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.1"
          d="M12.7023 1.52783L10.3511 4.7639"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.4"
          d="M12.7023 14.472L10.3511 11.236"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.6"
          d="M3.29773 14.472L5.64887 11.236"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.2"
          d="M15.6085 5.52783L11.8043 6.7639"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.7"
          d="M0.391602 10.472L4.19583 9.23598"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.3"
          d="M15.6085 10.4722L11.8043 9.2361"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
        <path
          opacity="0.8"
          d="M0.391602 5.52783L4.19583 6.7639"
          stroke="currentColor"
          strokeWidth="1.5"
        ></path>
      </g>
      <defs>
        <clipPath id="clip0_2393_1490">
          <rect width="16" height="16" fill="white"></rect>
        </clipPath>
      </defs>
    </svg>
  );
};

export const MessageIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width={size}
      style={{ color: "currentcolor" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.8914 10.4028L2.98327 10.6318C3.22909 11.2445 3.5 12.1045 3.5 13C3.5 13.3588 3.4564 13.7131 3.38773 14.0495C3.69637 13.9446 4.01409 13.8159 4.32918 13.6584C4.87888 13.3835 5.33961 13.0611 5.70994 12.7521L6.22471 12.3226L6.88809 12.4196C7.24851 12.4724 7.61994 12.5 8 12.5C11.7843 12.5 14.5 9.85569 14.5 7C14.5 4.14431 11.7843 1.5 8 1.5C4.21574 1.5 1.5 4.14431 1.5 7C1.5 8.18175 1.94229 9.29322 2.73103 10.2153L2.8914 10.4028ZM2.8135 15.7653C1.76096 16 1 16 1 16C1 16 1.43322 15.3097 1.72937 14.4367C1.88317 13.9834 2 13.4808 2 13C2 12.3826 1.80733 11.7292 1.59114 11.1903C0.591845 10.0221 0 8.57152 0 7C0 3.13401 3.58172 0 8 0C12.4183 0 16 3.13401 16 7C16 10.866 12.4183 14 8 14C7.54721 14 7.10321 13.9671 6.67094 13.9038C6.22579 14.2753 5.66881 14.6656 5 15C4.23366 15.3832 3.46733 15.6195 2.8135 15.7653Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};

export const StopIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      viewBox="0 0 16 16"
      width={size}
      style={{ color: "currentcolor" }}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H13V13H3V3Z"
        fill="currentColor"
      ></path>
    </svg>
  );
};