import { Button } from "../ui/button";

export default function Filters({
  filters,
  setFilters,
  options,
}: {
  filters: string;
  setFilters: Function;
  options: string[];
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((option, index) => (
        <Button
          key={index}
          variant={
            filters.indexOf(option) !== -1 || (index === 0 && filters === "")
              ? "default"
              : "outline"
          }
          className="rounded-full"
          onClick={() => {
            if (index === 0) {
              setFilters("");
              return;
            }

            if (filters.indexOf(option) === -1) {
              setFilters(filters + option);
            } else {
              setFilters(filters.replace(option, ""));
            }
          }}
        >
          {option}
        </Button>
      ))}
    </div>
  );
}
