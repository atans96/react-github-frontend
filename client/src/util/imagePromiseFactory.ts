import './Extensions.d.ts';

export default ({ decode = true, crossOrigin = '' }) =>
  (src: string): Promise<void> => {
    return new Promise((resolve: any, reject) => {
      const i = new Image();
      if (crossOrigin) i.crossOrigin = src;
      i.onload = () => {
        const height = i.height;
        const width = i.width;
        decode && i.decode ? i.decode().then(resolve({ height, width, src })).catch(reject) : resolve();
      };
      // i.load('http://localhost:8080/' + src);
      // console.log(i.completedPercentage);
      i.onerror = reject;
      i.src = src;
    });
  };
