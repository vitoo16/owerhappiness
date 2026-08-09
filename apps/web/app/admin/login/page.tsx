import { LoginForm } from '@/components/admin/LoginForm';
import { RouteMotion } from '@/components/motion/RouteMotion';
import { Stickman } from '@/components/Stickman';

export const metadata = { title: 'Private Room' };

export default function LoginPage() {
  return (
    <RouteMotion variant="admin">
      <main className="login-page">
        <div className="login-card">
          <div>
            <p className="eyebrow">PRIVATE ROOM</p>
            <h1>my desk.</h1>
            <p>this room is private.</p>
            <Stickman pose="sleep" />
          </div>
          <LoginForm />
        </div>
      </main>
    </RouteMotion>
  );
}
