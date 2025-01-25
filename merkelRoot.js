const crypto = require("crypto");



// using class

let transaction=["james", "victor", "ochula"]

class MerkelTree{
    constructor(leaves, hashFunction=null){
        this.hashFunction=hashFunction || ((data)=>{
            return crypto.createHash("sha256").update(data).digest("hex");
        })

        this.leaves=leaves.map((leaf) => {
            if(typeof leaf=== "string" && leaf.match(/^[0-9a-f]{64}$/i)){
                return leaf
            }
            return this.hashFunction(JSON.stringify(leaf))
        })

        this.layers=this.buildTree(this.leaves)
    }


    // building the merkel tree
    buildTree(leaves){
        const layers=[leaves];

       while(layers[layers.length -1].length > 1){
          let currentLayer=layers[layers.length -1];
          let newLayer=[]
          for(let i = 0; i< currentLayer.length; i += 2){
            const left=currentLayer[i];
            const right=currentLayer[i +1] || left;
            newLayer.push(this.hashFunction(left + right))
          }
         
          layers.push(newLayer)
       }

       return layers;
    }
    

    // to get the root merkelRoot
    merkelRoot(){
        return this.layers[this.layers.length-1][0]
    }

    findTransactionIndex(transactionName) {
        let data=JSON.stringify(transactionName)
        const hashedInput= crypto.createHash("sha256").update(data).digest("hex");
        return this.layers[0].findIndex(tx => tx === hashedInput);
    }

    // to get the  proof
    getProof(transactionName){
        let currentIndex=this.findTransactionIndex(transactionName);

        const proof=[];

        // go throug each layer;
        for(let level=0; level< this.layers.length -1 ; level++){
            const currentLayer=this.layers[level];
            const isLeft=currentIndex % 2 === 0;
            const pairIndex=isLeft ? currentIndex + 1 : currentIndex -1;


            // if there is a paired element, add to the proof;
            if(pairIndex < currentLayer.length){
                proof.push({
                    position: isLeft? "right" : "left",
                    data: currentLayer[pairIndex]
                })
            }

            currentIndex=Math.floor(currentIndex/2)
        }

        return proof;
    }
   
    // to verifyProof
    verifyProof(leaf, merkleProof,root, hashFunction=null){
           hashFunction=hashFunction||((data) => {
            return crypto.createHash('sha256').update(data).digest('hex');
           })
         let transactionHash=hashFunction(JSON.stringify(leaf));

          for(let i=0; i < merkleProof.length ; i++){
             const siblingHash=merkleProof[i].data;

             if(transactionHash < siblingHash){
                transactionHash=hashFunction(transactionHash + siblingHash.data);
             }else {
                transactionHash =hashFunction(siblingHash.data + transactionHash)
             }
          }

          return transactionHash === root;
    }

    

}

let myMerkelTree=new MerkelTree(transaction)
let root=myMerkelTree.merkelRoot()

let proof=myMerkelTree.getProof("victor");
let verify=myMerkelTree.verifyProof("victor",proof,root)

console.log(verify)

