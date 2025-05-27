import { useGoogleLogin } from '@react-oauth/google'

export default function GoogleSignIn({ onLogin }) {
    const login = useGoogleLogin({
        scope: 'openid email https://www.googleapis.com/auth/calendar.events.readonly',
        onSuccess: (tokenResponse) => {
            const accessToken = tokenResponse.access_token; onLogin(accessToken);
        },
        onError: () => alert('Google sign-in failed'),
    })


    return (
        <button className="sign-in-btn" onClick={() => login()}>
            Sign in with Google
        </button>
    )
}