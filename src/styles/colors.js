let appColors = {
  light: '#CC0000',
  dark: '#990000',
  darker: '#330000',
  main: '#991000',
};
export function setAppColors(newAppColors) {
  appColors = newAppColors;
}

export function getBrandColors() {
  return appColors;
}

export function getBrandDarkerColor() {
  return appColors.darker;
}

export function getBrandDarkColor() {
  return appColors.dark;
}

export function getBrandLightColor() {
  return appColors.light;
}
