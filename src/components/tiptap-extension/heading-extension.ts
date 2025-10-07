import { Heading as TiptapHeading } from "@tiptap/extension-heading";

/**
 * Custom Heading Extension with Typography System
 *
 * This extension configures headings to automatically apply the typography system
 * with Poppins font family and proper sizing, weights, and spacing.
 */
export const CustomHeading = TiptapHeading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      level: {
        default: 1,
        rendered: true,
      },
      // Add inline style attribute to apply typography
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          const level = attributes.level as number;

          // Typography system configuration
          const fontFamily =
            "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
          const lineHeight = "1.15";
          const letterSpacing = "-0.022em";

          // Font sizes based on type scale
          const fontSizes: Record<number, string> = {
            1: "4.479rem", // 1.5x the largest size (H1)
            2: "2.074rem", // size-500 (H2)
            3: "2.074rem", // size-500 (H3)
            4: "1.728rem", // size-400 (H4)
            5: "1.44rem", // size-300 (H5)
            6: "1.2rem", // size-200 (H6)
          };

          // Font weights
          const fontWeights: Record<number, string> = {
            1: "700", // Bold
            2: "400", // Regular
            3: "500", // Medium
            4: "500", // Medium
            5: "500", // Medium
            6: "500", // Medium
          };

          // Margins
          const margins: Record<number, string> = {
            1: "0 0 5rem 0",
            2: "3rem 0 2rem 0",
            3: "2.5rem 0 1.5rem 0",
            4: "2rem 0 1.25rem 0",
            5: "1.75rem 0 1rem 0",
            6: "1.5rem 0 0.75rem 0",
          };

          const fontSize = fontSizes[level] || fontSizes[1];
          const fontWeight = fontWeights[level] || fontWeights[1];
          const margin = margins[level] || margins[1];

          const styleValue = [
            `font-family: ${fontFamily}`,
            `font-size: ${fontSize}`,
            `font-weight: ${fontWeight}`,
            `line-height: ${lineHeight}`,
            `letter-spacing: ${letterSpacing}`,
            `margin: ${margin}`,
          ].join("; ");

          return {
            style: styleValue,
          };
        },
      },
    };
  },
}).configure({
  levels: [1, 2, 3, 4, 5, 6],
});
