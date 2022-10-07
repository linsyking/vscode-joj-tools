const spawn = require("child_process").spawn

const child = spawn("ji-auth", ["joj"]);
child.stdout.setEncoding('utf-8');
child.stdout.on("data", (data) => {
    console.log(data);
    // playback(data)
})