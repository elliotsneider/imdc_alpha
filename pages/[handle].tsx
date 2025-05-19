import { GetServerSideProps } from 'next'
import { createClient } from '@supabase/supabase-js'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const handle = context.params?.handle as string;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('handle', handle)
    .single();

  if (!profile) return { notFound: true };

  return { props: { profile } };
};

export default function ProfilePage({ profile }: any) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">@{profile.handle}</h1>
      <p className="mt-2 italic">{profile.bio}</p>
      <img src={profile.image_url} alt="Identity Visual" className="mt-4 w-48 h-48 object-cover rounded-full" />
      <p className="mt-4 text-sm text-gray-600">Interests: {profile.interests?.join(', ')}</p>
    </div>
  );
}
