import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { PhoneIcon } from "lucide-react";
import { getApiError } from "@/api/api";
import { linkGoogle, linkPhone, requestOtp } from "@/api/auth.api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import {
  ensureGoogleGis,
  promptGoogleSignIn,
} from "@/lib/google-gis";
import {
  formatPhonePreview,
  isValidIndianMobile,
  RESEND_SECONDS,
} from "@/module/auth/phone-login";
import { useAuthStore } from "@/store/auth.store";

function GoogleMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AccountPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const updateUser = useAuthStore((s) => s.updateUser);
  const setLoginOpen = useAuthStore((s) => s.setLoginOpen);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneStep, setPhoneStep] = useState("phone");
  const [resendSeconds, setResendSeconds] = useState(0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "ready" && !user) {
      setLoginOpen(true);
      navigate("/", { replace: true });
    }
  }, [status, user, navigate, setLoginOpen]);

  useEffect(() => {
    if (resendSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setResendSeconds((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  if (status !== "ready" || !user) {
    return (
      <div className="mx-auto flex max-w-lg justify-center px-4 py-16">
        <Spinner className="size-6" />
      </div>
    );
  }

  async function sendOtp() {
    if (!isValidIndianMobile(phone)) {
      toast.add({ title: "Enter a valid 10-digit mobile number", type: "error" });
      return;
    }
    setPending(true);
    try {
      const data = await requestOtp({ phone: phone.trim() });
      setPhoneStep("otp");
      setOtp("");
      setResendSeconds(RESEND_SECONDS);
      if (data.otp) {
        toast.add({ title: `Dev OTP: ${data.otp}`, type: "info" });
      } else {
        toast.add({ title: "OTP sent to your phone", type: "success" });
      }
    } catch (err) {
      toast.add({ title: getApiError(err), type: "error" });
    } finally {
      setPending(false);
    }
  }

  async function submitLinkPhone(code) {
    if (code.length !== 6 || pending) return;
    setPending(true);
    try {
      const data = await linkPhone({ phone: phone.trim(), otp: code });
      updateUser(data.user);
      setPhoneStep("phone");
      setPhone("");
      setOtp("");
      toast.add({ title: "Phone linked to your account", type: "success" });
    } catch (err) {
      setOtp("");
      toast.add({ title: getApiError(err), type: "error" });
    } finally {
      setPending(false);
    }
  }

  async function onLinkGoogle() {
    if (pending) return;
    setPending(true);
    try {
      await ensureGoogleGis();
      const idToken = await promptGoogleSignIn();
      const data = await linkGoogle({ idToken });
      updateUser(data.user);
      toast.add({ title: "Google linked to your account", type: "success" });
    } catch (err) {
      if (err?.code !== "PROMPT_BLOCKED") {
        toast.add({ title: getApiError(err), type: "error" });
      }
    } finally {
      setPending(false);
    }
  }

  const hasPhone = Boolean(user.phone);
  const hasGoogle = Boolean(user.linkedGoogle);

  return (
    <div className="mx-auto max-w-lg px-4 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage how you sign in to Decoryy.
        </p>
      </div>

      <Card className="mb-6 shadow-none ring-0">
        <CardHeader>
          <CardTitle className="text-lg">Your account</CardTitle>
          <CardDescription>Signed in as {user.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar size="lg">
            {user.avatar ? <AvatarImage src={user.avatar} alt="" /> : null}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 text-sm">
            <p className="font-medium">{user.name}</p>
            {user.email ? (
              <p className="truncate text-muted-foreground">{user.email}</p>
            ) : null}
            {user.phone ? (
              <p className="text-muted-foreground">{formatPhonePreview(user.phone)}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!hasPhone ? (
        <Card className="mb-6 shadow-none ring-0">
          <CardHeader>
            <CardTitle className="text-lg">Link phone number</CardTitle>
            <CardDescription>
              Add your mobile for bookings and OTP sign-in on one account.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {phoneStep === "phone" ? (
              <>
                <div className="relative">
                  <PhoneIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    disabled={pending}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  disabled={pending || !isValidIndianMobile(phone)}
                  onClick={sendOtp}
                >
                  {pending ? <Spinner className="size-4" /> : null}
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Code sent to {formatPhonePreview(phone)}
                </p>
                <Field>
                  <FieldLabel htmlFor="link-phone-otp">Verification code</FieldLabel>
                  <FieldDescription>Enter the 6-digit OTP to link this number.</FieldDescription>
                  <InputOTP
                    id="link-phone-otp"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={otp}
                    onChange={(value) => {
                      setOtp(value);
                      if (value.length === 6) submitLinkPhone(value);
                    }}
                    disabled={pending}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </Field>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setPhoneStep("phone");
                      setOtp("");
                    }}
                  >
                    Change number
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto px-0"
                    disabled={pending || resendSeconds > 0}
                    onClick={sendOtp}
                  >
                    {resendSeconds > 0 ? `Resend in ${resendSeconds}s` : "Resend OTP"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : null}

      {!hasGoogle ? (
        <Card className="shadow-none ring-0">
          <CardHeader>
            <CardTitle className="text-lg">Link Google</CardTitle>
            <CardDescription>
              Connect Google sign-in to this account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              disabled={pending}
              onClick={onLinkGoogle}
            >
              {pending ? (
                <Spinner className="size-4" />
              ) : (
                <GoogleMark className="size-4" />
              )}
              Link Google account
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {hasPhone && hasGoogle ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Phone and Google are linked. You can sign in with either method on this account.
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          Back to home
        </Link>
      </p>
    </div>
  );
}
