import { Box, useMediaQuery } from "@chakra-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { css, Global } from "@emotion/react";
import { MEDIA_QUERIES } from "@/app/_constants/mediaQueries";

interface DynamicBackgroundProps {
  page: string;
  initialGradient: string; // Add this prop
  children: ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  page,
  initialGradient, // Use this prop
  children,
}) => {
  const [isSM] = useMediaQuery(MEDIA_QUERIES.sm);

  // Use initialGradient for the initial value
  const [bgGradient, setBgGradient] = useState<string>(initialGradient);
  const [showTriangles, setShowTriangles] = useState<boolean>(false);

  useEffect(() => {
    // Update the gradient based on the page and screen size
    let updatedGradient = initialGradient;

    switch (page) {
      case "/calendar":
        updatedGradient =
          "linear-gradient(73deg, rgba(44, 62, 80) 15%, rgba(108, 117, 125) 15%)";
        setShowTriangles(false);
        break;
      case "/about":
        updatedGradient = "rgba(44, 62, 80)";
        setShowTriangles(true);
        break;
      default:
        updatedGradient = initialGradient;
        setShowTriangles(false);
        break;
    }

    setBgGradient(updatedGradient);
  }, [page, isSM, initialGradient]);

  return (
    <>
      <Global
        styles={css`
          .dynamic-background {
            background: ${bgGradient};
            width: 100%;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 0;
          }
          .top-triangle {
            width: 40vw;
            height: 65vh;
            background: rgba(108, 117, 125);
            clip-path: polygon(70% 0%, 100% 0%, 100% 100%);
            position: fixed;
            top: 0;
            right: 0;
            z-index: 1;
          }
          .bottom-triangle {
            width: 150vw;
            height: 55vh;
            background: rgba(108, 117, 125);
            clip-path: polygon(100% 0%, 90% 100%, 100% 100%);
            position: fixed;
            bottom: 0;
            right: 0;
            z-index: 1;
          }
        `}
      />
      <Box className="dynamic-background" />
      {showTriangles && <Box className="top-triangle" />}
      {showTriangles && <Box className="bottom-triangle" />}
      <Box position="relative" zIndex={2}>
        {children}
      </Box>
    </>
  );
};

export default DynamicBackground;
