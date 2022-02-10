import axios from "axios"

import { useImageOnLoad } from 'usehooks-ts'

export default function Image({src,style:imgStyle, ...img}:any) {
  const { handleImageOnLoad, css } = useImageOnLoad()

  const style :any= {
    wrap: {
      position: 'relative',
      margin: 'auto',
      //@ts-ignore
      height:"100%",
      //@ts-ignore
      width:"100%",
      ...(imgStyle && imgStyle.width ? {width:imgStyle.width}:{}),
      ...(imgStyle && imgStyle.height ? {height:imgStyle.height}:{}),
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: `100%`,
      height: `100%`,
      objectFit:"cover",
      ...(imgStyle ?? {})
    }
  }

  return (
    <div style={style.wrap}>
      {/* Small image load fast */}
      <img
        style={{ ...style.image, ...css.thumbnail,filter: "blur(2px)" }}
        src="/img/img_placeholder.png"
        alt="thumbnail"
        {...img}
      />
      {/* Full size image */}
      <img
        onLoad={handleImageOnLoad}
        style={{ ...style.image, ...css.fullSize }}
        src={src}
        alt="fullImage"
        {...img}
      />
    </div>
  )
}

function getBase64(url) {
    return axios.get(url, {
        responseType: 'arraybuffer'
      })
      .then(response => Buffer.from(response.data, 'base64'))
      .catch(ex => {
        console.error(ex);
      });
  }
