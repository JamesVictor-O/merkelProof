const crypto = require("crypto");

function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

let data = ["A", "B", "C", "D", "E", "G", "F"];

// hashing the row datas into hash
let leafs = data.map(sha256);

function MerkelRoot(leafs) {
  if (leafs.length === 0) throw new Error("No leaf Provided");

  let tree = [...leafs];

  // building the three
  while (tree.length > 1) {
    const nextLevel = [];

    for (i = 0; i < tree.length; i += 2) {
      left = tree[i];
      right = tree[i + 1] || left;
      nextLevel.push(sha256(left + right));
    }

    tree = nextLevel;
  }

  console.log(tree);
}

// MerkelRoot(leafs)

// build the merkelTree

function buildMerkleTree(data){
    if(data.length == 0) throw new Error("cant build a merkleTree with zero data");
     tree=[data.map(sha256)]

     while(tree[tree.length -1].length > 1){
        const currentTree=tree[tree.length -1]
        let nextBranch=[]
        
        for(i=0; i<currentTree.length ; i+=2){
            let left=currentTree[i]
            let right=currentTree[i+1] || left;
            nextBranch.push(sha256(left + right));
        }
        tree.push(nextBranch)
     }

     return tree;
}


// using class

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
    // to get the  proof
    getProof(index){
        let currentIndex=index;
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

const merkelTree=new MerkelTree(data)
let root=merkelTree.merkelRoot()

const index = 2;
let proof=merkelTree.getProof(index);

const leaf=data[index]
let verify=merkelTree.verifyProof(leaf,proof,root);

console.log(proof)

