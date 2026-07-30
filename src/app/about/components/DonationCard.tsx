'use client';

import { Bitcoin, Coins, Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WALLETS = [
  {
    id: 'btc',
    icon: Bitcoin,
    name: 'Bitcoin',
    description: 'Support us with BTC',
    address: 'bc1qr7a9pqga96j5l49q00vrdcx495khl4fh525986',
  },
  {
    id: 'eth',
    icon: Coins,
    name: 'Ethereum',
    description: 'Support us with ETH',
    address: '0xFFaA8aD4001161ACAA8769D1c5ae40735DbAe4C1',
  },
] as const;

export function DonationCards() {
  const copy = async (address: string, name: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success(`${name} address copied`);
    } catch {
      toast.error('Could not copy the address');
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {WALLETS.map(({ id, icon: Icon, name, description, address }) => (
        <Card key={id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="text-accent size-5" aria-hidden />
              {name}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor={`${id}-address`}>Address</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                id={`${id}-address`}
                value={address}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => copy(address, name)}
                aria-label={`Copy ${name} address`}
              >
                <Copy />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
