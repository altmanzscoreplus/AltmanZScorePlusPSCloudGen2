import type { FC } from 'react';
import { useTheme } from '@mui/material/styles';

export const Logo: FC = () => {
  const theme = useTheme();
  const fillColor = theme.palette.primary.main;

  return (
<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="180.000000pt" height="180.000000pt" viewBox="0 0 180.000000 180.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,-450.000000) scale(0.100000,-0.100000)"
fill="#ff0000" stroke="none">
<path d="M558 1613 c-8 -10 -83 -157 -167 -328 -84 -170 -159 -316 -168 -323
-10 -7 -47 -12 -90 -12 l-73 0 0 -70 0 -70 98 0 c136 0 154 10 216 125 175
320 168 310 206 310 44 0 43 2 160 -310 50 -132 115 -303 145 -380 30 -77 72
-189 94 -249 49 -131 62 -152 107 -173 33 -16 35 -16 62 4 40 30 67 74 221
362 77 145 145 269 151 275 6 6 61 13 123 16 l112 5 0 75 0 75 -135 3 c-80 1
-145 -2 -160 -8 -15 -7 -42 -40 -69 -88 -25 -42 -83 -142 -129 -222 -85 -149
-116 -190 -139 -190 -17 0 -55 62 -81 135 -12 33 -57 158 -102 277 -44 120
-80 221 -80 226 0 5 -13 43 -29 83 -16 41 -53 137 -81 214 -70 193 -71 194
-98 226 -28 33 -71 39 -94 12z"/>
</g>
</svg>

  );
};
