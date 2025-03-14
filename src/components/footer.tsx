const Footer = () => {
    return (
        <footer className="w-full text-center py-4 mt-6">
            <p className="text-sm">
                © {new Date().getFullYear()} Free Nutrition Facts Label Generator By
                <a href="https://mysupersnack.com" className="text-blue-500 hover:underline"> MySuperSnack.com</a>
            </p>
            <p className="text-xs mt-2">
                This tool is for informational purposes only and does not replace professional dietary advice. Any question ? Feel free to contact us contact@mysupersnack.com
            </p>
        </footer>
    );
};

export default Footer;
