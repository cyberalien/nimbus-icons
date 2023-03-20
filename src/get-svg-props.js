const sizeMap = {
  small: 16,
  medium: 24,
  large: 32,
  fixed: "1em",
};

export default function getSvgProps({
  name,
  "aria-label": ariaLabel,
  size,
  svgDataByHeight,
}) {
  const height = sizeMap[size] || parseInt(size) || 0;
  const naturalHeight = closestNaturalHeight(
    Object.keys(svgDataByHeight),
    height
  );
  const naturalWidth = svgDataByHeight[naturalHeight].width;
  const width = Number.isInteger(height)
    ? height * (naturalWidth / naturalHeight)
    : height;
  const path = svgDataByHeight[naturalHeight].path;

  return {
    "aria-hidden": "true",
    "aria-label": ariaLabel || name,
    role: "img",
    viewBox: `0 0 ${naturalWidth} ${naturalHeight}`,
    width,
    height,
    fill: "currentColor",
    style: {
      display: "inline-block",
      userSelect: "none",
      verticalAlign: "middle",
    },
    dangerouslySetInnerHTML: { __html: path },
  };
}

function closestNaturalHeight(naturalHeights, height) {
  return naturalHeights
    .map((naturalHeight) => parseInt(naturalHeight, 10))
    .reduce(
      (acc, naturalHeight) => (naturalHeight <= height ? naturalHeight : acc),
      naturalHeights[0]
    );
}
