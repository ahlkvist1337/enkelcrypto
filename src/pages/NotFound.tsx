import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Helmet>
      <title>Sidan hittades inte | EnkelCrypto</title>
      <meta name="robots" content="noindex" />
    </Helmet>
    <Header />
    <main className="flex-grow flex items-center justify-center px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Sidan hittades inte</h1>
        <p className="text-muted-foreground">Sidan du letar efter finns inte eller har flyttats.</p>
        <Button asChild><Link to="/">Till startsidan</Link></Button>
      </div>
    </main>
    <Footer />
  </div>
);

export default NotFound;
