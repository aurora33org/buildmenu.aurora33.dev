'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/shared/ui/button';
import { Card, CardContent } from '@/components/shared/ui/card';
import { StepIndicator } from './StepIndicator';
import { Step1Welcome } from './Step1Welcome';
import { Step2Restaurant } from './Step2Restaurant';
import { Step3Contact } from './Step3Contact';
import { Step4Template } from './Step4Template';
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
} from '@/lib/validations/onboarding.schema';

const TOTAL_STEPS = 4;

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1
  const [fullName, setFullName] = useState('');

  // Step 2
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');

  // Step 3
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [tiktokHandle, setTiktokHandle] = useState('');

  // Step 4
  const [templateId, setTemplateId] = useState('classic');

  const validateCurrentStep = () => {
    setError('');

    try {
      if (currentStep === 1) {
        onboardingStep1Schema.parse({ fullName });
      } else if (currentStep === 2) {
        onboardingStep2Schema.parse({
          restaurantName,
          slug,
          description: description || undefined,
        });
      } else if (currentStep === 3) {
        onboardingStep3Schema.parse({
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          address: address || undefined,
          facebookUrl: facebookUrl || undefined,
          instagramHandle: instagramHandle || undefined,
          tiktokHandle: tiktokHandle || undefined,
        });
      } else if (currentStep === 4) {
        onboardingStep4Schema.parse({ templateId });
      }
      return true;
    } catch (err: any) {
      if (err.errors && err.errors[0]) {
        setError(err.errors[0].message);
      } else {
        setError('Por favor completa los campos requeridos');
      }
      return false;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < TOTAL_STEPS) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          restaurantName,
          slug,
          description: description || undefined,
          contactEmail: contactEmail || undefined,
          contactPhone: contactPhone || undefined,
          address: address || undefined,
          facebookUrl: facebookUrl || undefined,
          instagramHandle: instagramHandle || undefined,
          tiktokHandle: tiktokHandle || undefined,
          templateId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al completar onboarding');
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al completar onboarding');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (currentStep === TOTAL_STEPS) {
                handleSubmit();
              } else {
                handleNext();
              }
            }}
          >
            {/* Step 1 */}
            {currentStep === 1 && (
              <Step1Welcome
                fullName={fullName}
                setFullName={setFullName}
                error={error}
              />
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <Step2Restaurant
                restaurantName={restaurantName}
                setRestaurantName={setRestaurantName}
                slug={slug}
                setSlug={setSlug}
                description={description}
                setDescription={setDescription}
                error={error}
              />
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <Step3Contact
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactPhone={contactPhone}
                setContactPhone={setContactPhone}
                address={address}
                setAddress={setAddress}
                facebookUrl={facebookUrl}
                setFacebookUrl={setFacebookUrl}
                instagramHandle={instagramHandle}
                setInstagramHandle={setInstagramHandle}
                tiktokHandle={tiktokHandle}
                setTiktokHandle={setTiktokHandle}
                error={error}
              />
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <Step4Template
                templateId={templateId}
                setTemplateId={setTemplateId}
                error={error}
              />
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                >
                  Atrás
                </Button>
              )}

              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading
                  ? 'Procesando...'
                  : currentStep === TOTAL_STEPS
                  ? 'Completar Onboarding'
                  : 'Siguiente'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
