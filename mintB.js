const {
    createV1,
    updateV1,
    Collection,
    CreateMetadataAccountV3InstructionAccounts,
    CreateMetadataAccountV3InstructionDataArgs,
    Creator,
    MPL_TOKEN_METADATA_PROGRAM_ID,
    UpdateMetadataAccountV2InstructionAccounts,
    UpdateMetadataAccountV2InstructionData,
    Uses,
    createMetadataAccountV3,
    updateMetadataAccountV2,
    findMetadataPda,
    CreateV1InstructionAccounts,
    CreateV1InstructionData,
    TokenStandard,
    CollectionDetails,
    PrintSupply,
    UpdateV1InstructionData,
    UpdateV1InstructionAccounts,
    Data
} = require("@metaplex-foundation/mpl-token-metadata");
const web3 = require("@solana/web3.js");
const {
    PublicKey,
    createSignerFromKeypair,
    none,
    percentAmount,
    publicKey,
    signerIdentity,
    some
} = require("@metaplex-foundation/umi");
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { fromWeb3JsKeypair, fromWeb3JsPublicKey } = require('@metaplex-foundation/umi-web3js-adapters');
const bs58 = require("bs58");

const SPL_TOKEN_2022_PROGRAM_ID = publicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');

function loadWalletKey(keypairFile) {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString()))
    );
    return loaded;
}

const INITIALIZE = true;

async function main() {
    console.log("let's name our token!");
    const myKeypair = loadWalletKey("chaidex.json");
    const mint = new web3.PublicKey("ChaiAkkeXYJkygMV3CPWWMtmgLzXHbmx2dKkhywqjZc3");

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = {
        name: "ChaiT",
        symbol: "CHAIT",
        uri: "https://raw.githubusercontent.com/Rahul-Prasad-07/Foundry/main/Metadata.json",
    }
    if (INITIALIZE) {
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: percentAmount(0, 2),
            creators: none(),
            collection: none(),
            uses: none(),
        }
        const accounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data = {
            ...onChainData,
            isMutable: true,
            discriminator: 0,
            tokenStandard: TokenStandard.Fungible,
            collectionDetails: none(),
            ruleSet: none(),
            createV1Discriminator: 0,
            primarySaleHappened: true,
            decimals: none(),
            printSupply: none(),
        }
        const txid = await createV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    } else {
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: 0,
            creators: none(),
            collection: none(),
            uses: none(),
        }
        const accounts = {
            mint: fromWeb3JsPublicKey(mint),
        }
        const data = {
            discriminator: 0,
            data: some(onChainData),
            updateV1Discriminator: 0,
        }
        const txid = await updateV1(umi, { ...accounts, ...data }).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    }
}

main();
