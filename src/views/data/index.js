const lightConfig = {
  light: {
    enabled: true,
    type: [
      {
        min: 0,
        max: 5 * 60 * 60,
        value: "moonLight",
      },
      {
        min: 5 * 60 * 60,
        max: 7 * 60 * 60,
        value: "sunLight",
      },
      {
        min: 7 * 60 * 60,
        max: 19 * 60 * 60,
        value: "sunLight",
      },
      {
        min: 19 * 60 * 60,
        max: 20 * 60 * 60,
        value: "sunLight",
      },
      {
        min: 20 * 60 * 60,
        max: 24 * 60 * 60,
        value: "moonLight",
      },
    ],
    intensity: [
      {
        min: 0,
        max: 5 * 60 * 60,
        value: [0.01, 0.2],
      },
      {
        min: 5 * 60 * 60,
        max: 7 * 60 * 60,
        value: [0.2, 1],
      },
      {
        min: 7 * 60 * 60,
        max: 19 * 60 * 60,
        value: 1,
      },
      {
        min: 19 * 60 * 60,
        max: 20 * 60 * 60,
        value: [1, 0.1],
      },
      {
        min: 20 * 60 * 60,
        max: 24 * 60 * 60,
        value: [0.1, 0.01],
      },
    ],
    color: [
      {
        min: 0 * 60 * 60,
        max: 17 * 60 * 60,
        value: "#ffffff",
      },
      {
        min: 17 * 60 * 60 + 1,
        max: 18.5 * 60 * 60,
        value: ["#ffffff", "#E8E6B8"],
      },
      {
        min: 18.5 * 60 * 60 + 1,
        max: 19 * 60 * 60,
        value: ["#E8E6B8", "#ffffff"],
      },
      {
        min: 19 * 60 * 60,
        max: 24 * 60 * 60,
        value: "#ffffff",
      },
    ],
  },
};
export default {lightConfig};
