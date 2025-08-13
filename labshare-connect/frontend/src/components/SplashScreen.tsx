import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FlaskConical, Eye } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Cycle feature icons every 1.5s
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(stepTimer);
  }, []);

  // End splash after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 15000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const features = [
    { icon: Upload, text: "Upload practical experiments" },
    { icon: FlaskConical, text: "Share knowledge with peers" },
    { icon: Eye, text: "Access all experiments" }
  ];

  return (
    <div className="fixed inset-0 bg-lab-background flex items-center justify-center z-50">
      <div className="text-center space-y-8 px-8 max-w-md">
        {/* Logo/Title */}
        <div className="space-y-4 animate-fade-in">
          <div className="relative">
            <h1 className="text-4xl font-bold text-green-500 tracking-tight">
              BE COMPS
            </h1>
            <div className="text-green-400 text-2xl font-semibold">
              Lab Upload
            </div>
          </div>
          <p className="text-lab-foreground/70 text-lg">
            Upload your practical experiments and share knowledge
          </p>
        </div>

        {/* Feature Icons */}
        <div className="space-y-6 animate-slide-up">
          <div className="flex justify-center space-x-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg bg-lab-card border border-lab-border transition-all duration-500 ${
                    index === currentStep
                      ? "scale-110 animate-pulse-glow border-green-400 bg-green-400/10 shadow-[0_0_15px_#22d3ee]"
                      : "opacity-60"
                  }`}
                >
                  <Icon className="w-8 h-8 text-green-400" />
                </div>
              );
            })}
          </div>

          {/* Feature Text */}
          <div className="h-8 flex items-center justify-center">
            <p className="text-lab-foreground/80 transition-opacity duration-300">
              {features[currentStep].text}
            </p>
          </div>

          {/* Enter Button */}
          <div className="pt-4">
            <Button
              onClick={onComplete}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 text-lg font-medium rounded-lg transition-all duration-300 hover:scale-105"
            >
              <Eye className="w-5 h-5 mr-2" />
              Enter Lab
            </Button>
          </div>
        </div>

        {/* Skip option */}
        <button
          onClick={onComplete}
          className="text-lab-foreground/50 text-sm hover:text-lab-foreground/70 transition-colors duration-200"
        >
          Skip intro →
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
