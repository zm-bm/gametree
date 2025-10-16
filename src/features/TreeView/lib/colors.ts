import { scaleLinear } from '@visx/scale';

const COLOR_RANGE = ["#a50026", "#a70226", "#a90426", "#ab0626", "#ad0826", "#af0926", "#b10b26", "#b30d26", "#b50f26", "#b61127", "#b81327", "#ba1527", "#bc1727", "#be1927", "#c01b27", "#c21d28", "#c41f28", "#c52128", "#c72328", "#c92529", "#cb2729", "#cc2929", "#ce2b2a", "#d02d2a", "#d12f2b", "#d3312b", "#d4332c", "#d6352c", "#d7382d", "#d93a2e", "#da3c2e", "#dc3e2f", "#dd4030", "#de4331", "#e04532", "#e14733", "#e24a33", "#e34c34", "#e44e35", "#e55136", "#e75337", "#e85538", "#e95839", "#ea5a3a", "#eb5d3c", "#ec5f3d", "#ed613e", "#ed643f", "#ee6640", "#ef6941", "#f06b42", "#f16e43", "#f17044", "#f27346", "#f37547", "#f37848", "#f47a49", "#f57d4a", "#f57f4b", "#f6824d", "#f6844e", "#f7864f", "#f78950", "#f88b51", "#f88e53", "#f89054", "#f99355", "#f99557", "#f99858", "#fa9a59", "#fa9c5b", "#fa9f5c", "#fba15d", "#fba35f", "#fba660", "#fba862", "#fcaa63", "#fcad65", "#fcaf66", "#fcb168", "#fcb369", "#fcb56b", "#fdb86d", "#fdba6e", "#fdbc70", "#fdbe72", "#fdc073", "#fdc275", "#fdc477", "#fdc678", "#fdc87a", "#fdca7c", "#fecc7e", "#fecd80", "#fecf81", "#fed183", "#fed385", "#fed587", "#fed689", "#fed88a", "#feda8c", "#fedb8e", "#fedd90", "#fede92", "#fee094", "#fee196", "#fee397", "#fee499", "#fee69b", "#fee79d", "#fee89f", "#feeaa1", "#feeba3", "#feeca4", "#feeda6", "#feeea8", "#fef0aa", "#fef1ac", "#fdf2ae", "#fdf2b0", "#fdf3b2", "#fdf4b4", "#fcf5b6", "#fcf6b8", "#fbf6ba", "#fbf7bc", "#faf7be", "#faf8c0", "#f9f8c2", "#f9f8c4", "#f8f9c6", "#f7f9c8", "#f7f9ca", "#f6f9cc", "#f5f9ce", "#f4f9d0", "#f3f9d2", "#f2f9d4", "#f1f8d6", "#f0f8d8", "#eff8da", "#edf8dc", "#ecf7dd", "#ebf7df", "#eaf6e1", "#e8f6e2", "#e7f5e4", "#e6f5e5", "#e4f4e7", "#e3f3e8", "#e1f3e9", "#e0f2ea", "#def1eb", "#dcf1ec", "#dbf0ed", "#d9efed", "#d7eeee", "#d5eeee", "#d4edef", "#d2ecef", "#d0ebef", "#ceeaef", "#cce9ef", "#cae8ef", "#c8e7ef", "#c6e6ef", "#c5e5ef", "#c3e4ee", "#c0e3ee", "#bee2ee", "#bce1ed", "#bae0ed", "#b8deec", "#b6ddeb", "#b4dceb", "#b2dbea", "#b0d9e9", "#aed8e9", "#acd7e8", "#aad5e7", "#a7d4e6", "#a5d2e6", "#a3d1e5", "#a1d0e4", "#9fcee3", "#9dcde2", "#9bcbe1", "#99c9e1", "#96c8e0", "#94c6df", "#92c4de", "#90c3dd", "#8ec1dc", "#8cbfdb", "#8abeda", "#88bcd9", "#86bad8", "#84b8d7", "#82b6d6", "#7fb5d5", "#7db3d4", "#7bb1d3", "#79afd2", "#77add1", "#75abd0", "#73a9cf", "#71a7ce", "#6fa5cd", "#6da3cc", "#6ca1cb", "#6a9fca", "#689dc9", "#669bc8", "#6499c7", "#6297c5", "#6094c4", "#5f92c3", "#5d90c2", "#5b8ec1", "#598cc0", "#5889bf", "#5687be", "#5485bc", "#5383bb", "#5180ba", "#507eb9", "#4e7cb8", "#4d7ab7", "#4c77b5", "#4a75b4", "#4973b3", "#4870b2", "#466eb1", "#456cb0", "#4469ae", "#4367ad", "#4264ac", "#4162ab", "#4060aa", "#3f5da8", "#3e5ba7", "#3d58a6", "#3c56a5", "#3b54a4", "#3a51a2", "#394fa1", "#384ca0", "#374a9f", "#37479e", "#36459c", "#35429b", "#34409a", "#333d99", "#333b97", "#323896", "#313695"];
const COLOR_DOMAIN = COLOR_RANGE.map((_, i, arr) => (i / (arr.length - 1) * 2) - 1); // map to [-1, 1]

export const colorScale = (value: number) => {
  const clampedValue = Math.max(-1, Math.min(1, value));
  const exp = 0.375;
  const transformedValue = Math.sign(clampedValue) * Math.pow(Math.abs(clampedValue), exp);

  return scaleLinear({
    domain: COLOR_DOMAIN,
    range: COLOR_RANGE,
  })(transformedValue);
};

export const COLORS = {
  win: COLOR_RANGE.at(-1),
  nearwin: COLOR_RANGE.at(Math.floor(COLOR_RANGE.length * 7 / 8)),
  winning: COLOR_RANGE.at(Math.floor(COLOR_RANGE.length * 3 / 4)),
  draw: COLOR_RANGE.at(Math.floor(COLOR_RANGE.length / 2)),
  losing: COLOR_RANGE.at(Math.floor(COLOR_RANGE.length / 4)),
  nearlose: COLOR_RANGE.at(Math.floor(COLOR_RANGE.length / 8)),
  lose: COLOR_RANGE.at(0),
  placeholder: '#a1a1aa', // zinc-400
};
