import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, symbol, image, description } = body;
        if (!name || !symbol || !image) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        //prepare the JSON data to be uploaded
        const pinataBody = {
            pinataContent: {
                name: name,
                symbol: symbol,
                description: description || `A token named ${name}`,
                image: image,
            },
            pinataMetadata: {
                name: `${symbol}-metadata.json`,
            },

        };

        const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.PINATA_JWT}`,
            },
            body: JSON.stringify(pinataBody),
        });

        if (!response.ok) {

            const errorText = await response.text();
            throw new Error(`Pinata API Error: ${response.status} ${errorText}`);
        }

        const responseData = await response.json();
        const { IpfsHash } = responseData;


        const metadataUri = `${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${IpfsHash}`;


        return NextResponse.json({ uri: metadataUri });

    } catch (error: any) {
        console.error("Error uploading to Pinata:", error.message);
        return NextResponse.json({ error: "Failed to upload metadata" }, { status: 500 });
    }
}
