import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Seo from '../components/Seo';
import { Calendar, Search, Phone, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import strings from "../strings.json";
import { useCallback, useState } from "react";
import Filters from "@/components/custom/Filters";
import NewsletterPanel from "@/components/custom/NewslatterPanel";
import { SportEvent } from "@/lib/model/SportEvent";

const categories = ["Wszystkie", "KJS", "Inny"];

const events = [
  {
    title: "10 Ways to Optimize Your SaaS Business",
    short:
      "Learn the best practices for growing and optimizing your SaaS business in today's competitive market.",
    organizer: "Sarah Johnson",
    date: "Mar 15, 2024",
    registrationDate: "Mar 14, 2024",
    category: "KJS",
    image:
      "https://cdn.pixabay.com/photo/2014/07/17/13/44/rally-395505_1280.jpg",
    places: {
      all: 50,
      occupied: 14,
    },
  },
  {
    title: "The Future of Cloud Computing",
    short:
      "Explore the latest trends and innovations shaping the future of cloud computing and SaaS solutions.",
    organizer: "Michael Chen",
    date: "Mar 12, 2024",
    registrationDate: "Mar 12, 2024",
    category: "KJS",
    image:
      "https://cdn.pixabay.com/photo/2020/10/05/11/03/truck-5628970_1280.jpg",
    places: {
      all: 72,
      occupied: 71,
    },
  },
  {
    title: "Getting Started with SaaSify",
    short:
      "A comprehensive guide to help you get started with SaaSify and make the most of its features.",
    organizer: "Emily Rodriguez",
    date: "Mar 10, 2024",
    registrationDate: "Mar 08, 2024",
    category: "Inny",
    image:
      "https://cdn.pixabay.com/photo/2022/10/28/13/23/car-7553144_1280.jpg",
    places: {
      all: 60,
      occupied: 60,
    },
  },
  {
    title: "How Company X Increased Revenue by 200%",
    short:
      "A detailed case study of how Company X leveraged SaaSify to achieve remarkable growth.",
    organizer: "David Wilson",
    date: "Mar 08, 2024",
    registrationDate: "Mar 08, 2024",
    category: "KJS",
    image:
      "https://cdn.pixabay.com/photo/2021/09/18/11/05/motorbike-6634868_1280.jpg",
    places: {
      all: 21,
      occupied: 12,
    },
  },
];

export default function Home() {
  const [filters, setFilters] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleOnChange = useCallback(
    (event: any) => {
      setSearchInput(event.target.value);
    },
    [searchInput]
  );

  const isEventInSearchResults = (event: SportEvent): boolean => {
    return (
      searchInput === "" ||
      event.title
        .toLocaleLowerCase()
        .indexOf(searchInput.toLocaleLowerCase()) !== -1
    );
  };

  const isEventInFilteredResults = (event: SportEvent): boolean => {
    return filters === "" || filters.indexOf(event.category) !== -1;
  };

  return (
    <>
      <Seo
        title={strings.seo.mainPage.title}
        description={strings.seo.mainPage.description}
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="py-0">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {strings.pages.mainPage.labelTop.first}
                </h1>
                <p className="text-xl text-muted-foreground">
                  {strings.pages.mainPage.labelTop.second}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Search and Categories */}
        <section className="p4-8 pt-8">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-8">
                <Filters
                  options={categories}
                  filters={filters}
                  setFilters={setFilters}
                />
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj wydarzenia..."
                    className="pl-10"
                    value={searchInput}
                    onChange={handleOnChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid md:grid-cols-2 gap-8">
                {events.map((event, index) => {
                  return isEventInSearchResults(event) &&
                    isEventInFilteredResults(event) ? (
                    <motion.article
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-video relative">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="object-cover w-full h-full"
                        />
                        {event.date !== event.registrationDate ? (
                          <div className="relative mt-[-24px] text-end">
                            <p className="text-white bg-primary px-4">
                              Zapisy do {event.registrationDate}
                            </p>
                          </div>
                        ) : null}
                        <div className="absolute top-4 left-4">
                          <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-sm">
                            {event.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {event.organizer}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Car className="h-4 w-4" />
                            {`${event.places.all} / ${event.places.occupied}`}
                          </div>
                        </div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                          {event.title}
                        </h2>
                        <p className="text-muted-foreground mb-4">
                          {event.short}
                        </p>
                        <div className="w-full flex">
                          <Button
                            variant="link"
                            className="p-0 h-auto flex-1 text-secondary-foreground hover:text-primary"
                          >
                            Zobacz więcej
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 h-auto flex-1 text-secondary-foreground hover:text-primary"
                          >
                            Zapisy/Lista startowa
                          </Button>
                          <Button
                            variant="link"
                            className="p-0 h-auto flex-1 text-secondary-foreground hover:text-primary"
                          >
                            Komunikaty
                          </Button>
                        </div>
                      </div>
                    </motion.article>
                  ) : null;
                })}
              </div>
            </div>
          </div>
        </section>
        <NewsletterPanel />
      </div>
    </>
  );
} 