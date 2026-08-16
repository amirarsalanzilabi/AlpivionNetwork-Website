import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, X, ImageIcon } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Flight {
  id: string;
  title: string;
  route: string;
  date: string;
  is_completed: boolean;
}

interface StoragePhoto {
  name: string;
  url: string;
}

const FlightGallery = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [flight, setFlight] = useState<Flight | null>(null);
  const [photos, setPhotos] = useState<StoragePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFlightAndPhotos();
    }
  }, [id]);

  const fetchFlightAndPhotos = async () => {
    try {
      // Fetch flight details
      const { data: flightData, error: flightError } = await supabase
        .from("flights")
        .select("id, title, route, date, is_completed")
        .eq("id", id)
        .single();

      if (flightError) throw flightError;
      setFlight(flightData);

      // List files directly from storage bucket using flight ID as folder
      const { data: files, error: listError } = await supabase.storage
        .from("flight-photos")
        .list(id, {
          sortBy: { column: "created_at", order: "desc" },
        });

      if (listError) throw listError;

      // Filter to only include actual image files
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg"];
      const photoFiles = (files || []).filter((file) => {
        const fileName = file.name.toLowerCase();
        return imageExtensions.some((ext) => fileName.endsWith(ext));
      });

      const photosWithUrls: StoragePhoto[] = photoFiles.map((file) => {
        const { data: urlData } = supabase.storage
          .from("flight-photos")
          .getPublicUrl(`${id}/${file.name}`);
        
        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      });

      setPhotos(photosWithUrls);
    } catch (error) {
      console.error("Error fetching flight gallery:", error);
      toast({
        title: "Error",
        description: "Failed to load gallery",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Flight not found</h1>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {flight.title}
            </h1>
            <p className="text-muted-foreground mt-1">
              {flight.route} • {formatDate(flight.date)}
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        {photos.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No photos yet</h2>
            <p className="text-muted-foreground">
              Photos from this flight will appear here soon.
            </p>
          </div>
        ) : (
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {photos.map((photo) => (
                <CarouselItem key={photo.name} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4 select-none">
                  <div
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity glass-card"
                    onClick={() => setSelectedImage(photo.url)}
                  >
                    <img
                      src={photo.url}
                      alt="Flight photo"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 border-border hover:bg-primary/20" />
            <CarouselNext className="hidden md:flex -right-4 bg-background/80 border-border hover:bg-primary/20" />
          </Carousel>
        )}
      </main>

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Flight photo"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <Footer />
    </div>
  );
};

export default FlightGallery;
