import Layout from 'components/layout/CardLayout';
import EmailField from 'components/EmailField';
import Button from 'components/Button';
import Link from 'components/Link';
import { useRouter } from 'next/router';
import { getCsrfToken } from 'next-auth/react';
import type { NextPageContext } from 'next';

interface SignUpProps {
  csrfToken: string;
}

export default function SignUp({ csrfToken }: SignUpProps) {
  const router = useRouter();

  return (
    <Layout header="Sign Up">
      <form
        method="post"
        action={`/api/auth/signin/email?callbackUrl=${
          router?.query?.callbackUrl || '/settings'
        }`}
      >
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <EmailField label="Email address" id="email" required />
        <Button type="submit" block>
          Sign up with Email
        </Button>
      </form>
      <p className="text-sm pt-3 text-gray-600">
        Already have an account? <Link href="/signin">Sign in</Link>
      </p>

      <p className="text-sm pt-3 text-gray-600">
        By signing up, you agree to our{' '}
        <a
          target="_blank"
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          href="/legal/terms"
        >
          Terms
        </a>{' '}
        and{' '}
        <a
          className="text-blue-600 hover:text-blue-800 visited:text-purple-600"
          target="_blank"
          href="/legal/privacy"
        >
          Privacy Policy.
        </a>
      </p>
    </Layout>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
      error: context.query.error || null,
    },
  };
}
