"use client"

import React from "react"
import Joyride, { Step, CallBackProps } from "react-joyride"

interface ReturnFormTourProps {
  run: boolean
  callback: (data: CallBackProps) => void
}

export function ReturnFormTour({ run, callback }: ReturnFormTourProps) {
  const steps: Step[] = [
    {
      target: "#tour-contact-info",
      content: "First, please provide your contact information so we can keep you updated on your return.",
      title: "Contact Information",
      placement: "bottom",
    },
    {
      target: "#tour-return-details",
      content: "Tell us about your return. Describe the issue in detail and let us know how you'd like us to resolve it.",
      title: "Return Details",
      placement: "bottom",
    },
    {
      target: "#tour-items-section",
      content: "Select the product(s) you wish to return. You can add multiple items if needed.",
      title: "Items to Return",
      placement: "top",
    },
    {
      target: "#tour-image-upload",
      content: "If your item is damaged or defective, uploading a photo can help us process your return faster.",
      title: "Product Images (Optional)",
      placement: "top",
    },
    {
      target: "#tour-submit-button",
      content: "Once you've filled out all the fields, click here to submit your request.",
      title: "Submit Your Return",
      placement: "top",
    },
    {
      target: "body",
      content: "After submitting, you'll receive a confirmation email with a tracking number. You can use this number to check the status of your return at any time. That's it!",
      title: "What Happens Next?",
      placement: "center",
    },
  ]

  return (
    <Joyride
      steps={steps}
      run={run}
      callback={callback}
      continuous
      showProgress
      showSkipButton
      styles={{
        options: {
          primaryColor: "#000000",
          textColor: "#333333",
          arrowColor: "#ffffff",
          backgroundColor: "#ffffff",
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: "0.625rem",
        },
        buttonNext: {
          borderRadius: "0.5rem",
        },
        buttonBack: {
          borderRadius: "0.5rem",
        },
      }}
    />
  )
}