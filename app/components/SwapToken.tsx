// src/components/SwapToken.tsx

'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
} from '@solana/web3.js';
import { createJupiterApiClient, QuoteGetRequest, SwapPostRequest } from '@jup-ag/api';
import BigNumber from 'bignumber.js';
import bs58 from 'bs58';
import { toast } from 'sonner';
import { RefreshCw, ArrowDown } from 'lucide-react';

// ShadCN UI Components
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';

// Token interface
interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI: string;
}

const jupiterApi = createJupiterApiClient();

export function SwapToken() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, sendTransaction, signTransaction } = wallet;

  const [tokens, setTokens] = useState<Token[]>([]);
  const [inputToken, setInputToken] = useState<string>('So11111111111111111111111111111111111111112'); // Default to SOL
  const [outputToken, setOutputToken] = useState<string>('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Default to USDC
  const [inputAmount, setInputAmount] = useState<string>('0.1');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.5%
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [swapping, setSwapping] = useState<boolean>(false);

  // Fetch tokens on component mount
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const tokenList = await fetch('https://token.jup.ag/strict').then((res) => res.json());
        setTokens(tokenList);
      } catch (error) {
        toast.error('Failed to fetch token list.');
        console.error('Failed to fetch token list:', error);
      }
    };
    fetchTokens();
  }, []);

  const inputTokenInfo = useMemo(() => tokens.find((t) => t.address === inputToken), [tokens, inputToken]);
  const outputTokenInfo = useMemo(() => tokens.find((t) => t.address === outputToken), [tokens, outputToken]);

  // Debounced quote fetching
  useEffect(() => {
    const handler = setTimeout(() => {
      if (parseFloat(inputAmount) > 0 && inputToken && outputToken) {
        getQuote();
      } else {
        setOutputAmount('');
        setQuote(null);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [inputAmount, inputToken, outputToken, slippageBps]);

  const getQuote = async () => {
    if (!inputTokenInfo || !outputTokenInfo || !parseFloat(inputAmount)) return;
    setLoading(true);
    setOutputAmount('');
    try {
      const amountInSmallestUnit = new BigNumber(inputAmount).shiftedBy(inputTokenInfo.decimals).integerValue().toString();

      const quoteParams: QuoteGetRequest = {
        inputMint: inputToken,
        outputMint: outputToken,
        amount: parseInt(amountInSmallestUnit),
        slippageBps,
      };

      const newQuote = await jupiterApi.quoteGet(quoteParams);

      if (newQuote) {
        const outAmount = new BigNumber(newQuote.outAmount).shiftedBy(-outputTokenInfo.decimals).toString();
        setOutputAmount(outAmount);
        setQuote(newQuote);
      } else {
         toast.error('No quote found for this pair.');
      }
    } catch (error) {
      toast.error('Error getting quote.');
      console.error('Get quote error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    if (!publicKey || !quote || !signTransaction) {
      toast.error('Please connect your wallet.');
      return;
    }

    setSwapping(true);
    try {
      // Get the swap transaction
      const swapParams: SwapPostRequest = {
        swapRequest: {
            quoteResponse: quote,
            userPublicKey: publicKey.toBase58(),
            wrapAndUnwrapSol: true, // Automatically wrap/unwrap SOL if needed
        }
      };

      const { swapTransaction } = await jupiterApi.swapPost(swapParams);

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      
      // We can't use sendTransaction directly as it doesn't return the raw transaction.
      // We need to serialize and send it manually.
      const rawTransaction = signedTransaction.serialize();
      
      // Execute the transaction
      const txid = await connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2,
      });

      // Confirm the transaction
      const confirmation = await connection.confirmTransaction(txid, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      toast.success(
        <div className="flex flex-col">
            <span>Swap successful!</span>
            <a href={`https://solscan.io/tx/${txid}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                View on Solscan
            </a>
        </div>
      );

    } catch (error) {
      toast.error('Swap failed. Please try again.');
      console.error('Swap error:', error);
    } finally {
      setSwapping(false);
      // Refresh quote after swap
      getQuote();
    }
  };

  const handleFlip = () => {
    const tempIn = inputToken;
    const tempInAmount = inputAmount;
    setInputToken(outputToken);
    setOutputToken(tempIn);
    setInputAmount(outputAmount);
    setOutputAmount(tempInAmount);
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Jupiter Swap</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-2">
          <Label htmlFor="input-amount">You Pay</Label>
          <div className="flex space-x-2">
            <Input
              id="input-amount"
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.0"
              className="flex-grow"
            />
            <TokenSelector tokens={tokens} selectedToken={inputToken} onSelectToken={setInputToken} />
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center my-[-10px]">
             <Button variant="ghost" size="icon" onClick={handleFlip}>
                <ArrowDown className="h-4 w-4"/>
             </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-2">
          <Label htmlFor="output-amount">You Receive</Label>
          <div className="flex space-x-2">
            <Input
              id="output-amount"
              type="text"
              value={loading ? 'Loading...' : outputAmount}
              readOnly
              placeholder="0.0"
              className="flex-grow bg-gray-100 dark:bg-gray-800"
            />
            <TokenSelector tokens={tokens} selectedToken={outputToken} onSelectToken={setOutputToken} />
          </div>
        </div>

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={!publicKey || swapping || loading || !quote || parseFloat(outputAmount) <= 0}
          className="w-full"
        >
          {publicKey ? (swapping ? 'Swapping...' : 'Swap') : 'Connect Wallet'}
        </Button>
      </CardContent>
    </Card>
  );
}

// A simple token selector component
function TokenSelector({
  tokens,
  selectedToken,
  onSelectToken,
}: {
  tokens: Token[];
  selectedToken: string;
  onSelectToken: (tokenAddress: string) => void;
}) {
  const selectedTokenInfo = tokens.find((t) => t.address === selectedToken);

  return (
    <Select value={selectedToken} onValueChange={onSelectToken}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Select Token">
          {selectedTokenInfo ? (
            <div className="flex items-center space-x-2">
              <img src={selectedTokenInfo.logoURI} alt={selectedTokenInfo.name} className="w-6 h-6 rounded-full" />
              <span>{selectedTokenInfo.symbol}</span>
            </div>
          ) : (
            'Select Token'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {tokens.map((token) => (
          <SelectItem key={token.address} value={token.address}>
            <div className="flex items-center space-x-2">
              <img src={token.logoURI} alt={token.name} className="w-6 h-6 rounded-full" />
              <span>{token.symbol}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}