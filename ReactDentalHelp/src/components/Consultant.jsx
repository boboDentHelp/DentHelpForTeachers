
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoCircledIcon } from "@radix-ui/react-icons";

const Consultant = () => {
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Alert>
                <InfoCircledIcon className="h-4 w-4 text-cyan-600" />
                <AlertTitle>Consultant Virtual</AlertTitle>
                <AlertDescription>
                    Funcționalitatea de chat consultativ a fost temporar dezactivată.
                    Pentru informații și programări, vă rugăm să utilizați secțiunile dedicate din aplicație.
                </AlertDescription>
            </Alert>
        </div>
    );
};

export default Consultant;
