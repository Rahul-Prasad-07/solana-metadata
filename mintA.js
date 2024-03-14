const { Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda } = require("@metaplex-foundation/mpl-token-metadata");
const { Connection, PublicKey, Keypair, SystemProgram, Transaction, TransactionInstruction, } = require("@solana/web3.js");
const { createSignerFromKeypair, none, signerIdentity, some } = require("@metaplex-foundation/umi")
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { fromWeb3JsKeypair, fromWeb3JsPublicKey } = require('@metaplex-foundation/umi-web3js-adapters');


function loadWalletKey(keypairFile) {
    const fs = require("fs");
    const loaded = Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}
const myKeypairr = loadWalletKey("./chaidex.json");
console.log('myKeypairr', myKeypairr);
const INITIALIZE = false;

async function main() {
    console.log("let's name some tokens!");
    const myKeypair = loadWalletKey("./chaidex.json");
    //const updateAuthority = loadWalletKey("./chaidex.json");
    const mint = new PublicKey("HJsf5MGdev8KJPytVb9JqCQ3Vf1CsxPCWhtKvL3gcndt");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair));
    // const signer2 = createSignerFromKeypair(umi, fromWeb3JsKeypair(updateAuthority));
    umi.use(signerIdentity(signer, true));

    const ourMetadata = {
        name: "ChaiT Token",
        symbol: "CT",
        uri: "https://raw.githubusercontent.com/Rahul-Prasad-07/Foundry/main/Metadata.json",
    }


    const onChainData = {
        ...ourMetadata,
        sellerFeeBasisPoints: 0,
        creators: none(),
        collection: none(),
        uses: none()
    }

    if (INITIALIZE) {

        const accounts = {
            mint: fromWeb3JsPublicKey(mint),
            mintAuthority: signer,
        }
        const data = {
            isMutable: true,
            collectionDetails: null,
            data: onChainData
        }

        const txid = await createMetadataAccountV3(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log(txid)

    } else {

        const data = {
            data: some(onChainData),
            discriminator: 0,
            isMutable: some(true),
            newUpdateAuthority: none(),
            primarySaleHappened: none()
        }
        const accounts = {
            metadata: findMetadataPda(umi, { mint: fromWeb3JsPublicKey(mint) }),
            updateAuthority: signer,
        }
        const txid = await updateMetadataAccountV2(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log(txid)
    }

}

main();