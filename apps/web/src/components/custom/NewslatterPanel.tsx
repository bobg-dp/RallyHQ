import { Button } from "../ui/button";
import { Input } from "../ui/input";
import strings from "../../strings.json";

export default function NewsletterPanel() {
  return (
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {strings.components.newsletter.title}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {strings.components.newsletter.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input
              type="email"
              placeholder={strings.components.newsletter.hint}
              className="max-w-md"
            />
            <Button className="bg-primary hover:bg-primary/90">
              {strings.components.newsletter.buttonText}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
