import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function VerificationCodeNewAccount({ isOpen, onClose, onSubmit }) {
    const [code, setCode] = useState('');

    const handleSubmit = () => {
        onSubmit(code);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Introduceți Codul de Verificare</DialogTitle>
                </DialogHeader>
                <Input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Cod de verificare"
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Anulează
                    </Button>
                    <Button onClick={handleSubmit}>Trimite</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
VerificationCodeNewAccount.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
export default VerificationCodeNewAccount;
