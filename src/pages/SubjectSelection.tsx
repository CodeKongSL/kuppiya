import { useNavigate } from "react-router-dom";
import { Microscope, TestTube, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const subjects = [
  {
    name: 'Bio',
    title: 'Biology',
    description: 'Study of living organisms and life processes',
    icon: Microscope,
    gradient: 'from-green-500 to-emerald-600',
    bgGradient: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950',
  },
  {
    name: 'Chemistry',
    title: 'Chemistry',
    description: 'Study of matter, composition, and reactions',
    icon: TestTube,
    gradient: 'from-blue-500 to-cyan-600',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950',
  },
  {
    name: 'Physics',
    title: 'Physics',
    description: 'Study of matter, energy, and fundamental forces',
    icon: Zap,
    gradient: 'from-purple-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950',
  },
];

export const SubjectSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">Choose Your Subject</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select a subject to access 10 years of past examination papers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {subjects.map((subject) => {
            const Icon = subject.icon;
            return (
              <Card
                key={subject.name}
                className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 cursor-pointer group"
              >
                <CardHeader className={`${subject.bgGradient} rounded-t-lg pb-8`}>
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${subject.gradient} shadow-lg`}>
                      <Icon className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl text-center">{subject.title}</CardTitle>
                  <CardDescription className="text-center">
                    {subject.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Button
                    onClick={() => navigate(`/papers/${subject.name}`)}
                    className={`w-full bg-gradient-to-r ${subject.gradient} hover:opacity-90 transition-opacity text-white`}
                    size="lg"
                  >
                    View Papers
                  </Button>
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    10 papers available
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};