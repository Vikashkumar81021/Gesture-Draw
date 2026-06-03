export const isPalmOpen = (lm) => {

  const fingers = [
    { tip: 8, pip: 6 },
    { tip: 12, pip: 10 },
    { tip: 16, pip: 14 },
    { tip: 20, pip: 18 },
  ];

  let extended = 0;

  fingers.forEach(({ tip, pip }) => {
    if (lm[tip].y < lm[pip].y) {
      extended++;
    }
  });

  if (lm[4].x < lm[3].x) {
    extended++;
  }

  return extended >= 4;
};

export const isWritingPose = (lm) =>
  lm[8].y < lm[6].y &&
  lm[12].y > lm[10].y &&
  lm[16].y > lm[14].y &&
  lm[20].y > lm[18].y;

export const isTwoFingersUp = (lm) =>
  lm[8].y < lm[6].y &&
  lm[12].y < lm[10].y &&
  lm[16].y > lm[14].y &&
  lm[20].y > lm[18].y;