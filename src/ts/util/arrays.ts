///<reference path="../primitives.ts"/>

// const array3Map = <T>(arr: T[][][], f: (t: T, x: number, y: number, z: number) => T | Falsey) => {
//   arr.forEach(
//       (v, x) => v.forEach(
//           (v, y) => v.map(
//               (v, z) => f(v, x, y, z) || v
//           )
//       )
//   );
// };

const array3New = <T>(width: number, height: number, depth: number, f?: (x: number, y: number, z: number) => T) => {
  return new Array(width).fill(0).map(
      (_, x) => new Array(height).fill(0).map(
          (_, y) => new Array(depth).fill(0).map(
              (_, z) => f?.(x, y, z)
          )
      )
  );
};

const arrayMapAndSet = <T>(arr: T[], f: (t: T, i: number) => T): void => {
  arr.forEach((t, i) => arr[i] = f(t, i));
};