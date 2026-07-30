import Image from 'next/image';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-6 flex flex-col items-center gap-2 rounded-md">
        <Image
          src="/logo_black_transparent.png"
          alt=""
          width={72}
          height={72}
          priority
          className="dark:hidden"
        />
        <Image
          src="/logo_color_transparent.png"
          alt=""
          width={72}
          height={72}
          priority
          className="hidden dark:block"
        />
        <span className="font-display text-xl font-semibold">MyWine.info</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-display text-2xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
          {footer}
        </CardContent>
      </Card>
    </div>
  );
}
