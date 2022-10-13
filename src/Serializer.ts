// Save and Load the course data

import { JOJItem, JOJProvider } from "./JOJDataProvider";

// {
//     courses:[
//         {
//             name: "",
//             role: "",
//             url: "",
//             cid: "",
//             children: [
//                 {
//                     name: "",
//                     url: "",
//                     children:[
//                         {
//                             name:"",
//                             url: "",
//                             iconPath: ""
//                         }
//                     ]
//                 }
//             ]
//         }
//     ]
// }

export function loadJOJTree(jojTreeJson:string, jojRoot: JOJProvider) {
    // Load the JOJ Tree From Json and add them to jojRoot

}


export function dumpJOJTree(jojRoot: JOJProvider){
    // TODO: Return the JSON String
    
}
