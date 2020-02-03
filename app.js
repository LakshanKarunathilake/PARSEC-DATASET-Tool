const { createInitialJSON } = require("./JSONHandler");
const {traversInParameterCombination} =require("./TaskRunner");

createInitialJSON()
    .then(()=>{
        traversInParameterCombination()
    })

