const spawn = require("child_process").spawn
import { submit_code } from "./JOJBackend"
// const child = spawn("ji-auth", ["joj"])
// child.stdout.setEncoding('utf-8')
// child.stdout.on("data", (data) => {
//     console.log(data)
//     // playback(data)
// })
const url = "https://joj.sjtu.edu.cn/d/vg151_fall_2022_manuel/homework/6339bd17dec511000656a606/6339b808dec511000656a5f1"
const zip_path = "./ex5.rar"
const lang = "matlab"
const sid = "00bcf31503b6168d9c6897c13765c4dc967046630008965bed0570e7989d54ca"
const playback = (arg0:string) => {
  console.log(1)
}
submit_code(url, zip_path, lang, sid, playback)