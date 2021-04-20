import './Extensions.d.ts';
import { convertToWebP } from '../services';
export default ({ decode = true, crossOrigin = '' }) => (src: string): Promise<void> => {
  return new Promise((resolve: any, reject) => {
    const i = new Image();
    if (crossOrigin) i.crossOrigin = src;
    i.onload = () => {
      const height = i.height;
      const width = i.width;
      convertToWebP(src).then((data) => {
        decode && i.decode
          ? i
              .decode()
              .then(resolve({ height, width, src: data }))
              .catch(reject)
          : resolve();
      });
    };
    // i.load('http://localhost:8080/' + src);
    // console.log(i.completedPercentage);
    i.onerror = reject;
    i.src = src;
  });
};
