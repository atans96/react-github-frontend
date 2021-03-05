import './Extensions.d.ts'
export default ({ decode = true, crossOrigin = '' }) => (src: string): Promise<void> => {
  return new Promise((resolve: any, reject) => {
    const i = new Image()
    if (crossOrigin) i.crossOrigin = src
    i.onload = () => {
      const height = i.height
      const width = i.width
      decode && i.decode ? i.decode().then(resolve({ height, width })).catch(reject) : resolve()
    }
    // i.load('https://cors-anywhere.herokuapp.com/' + src);
    // console.log(i.completedPercentage);
    i.onerror = reject
    i.src = src
  })
}
