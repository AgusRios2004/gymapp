export default function Button({ text, onClick, variant = 'primary', type = 'button' }) {
    const baseClasses = "px-6 py-3 rounded-md font-bold cursor-pointer transition-colors duration-300 border-2";
    
    const variants = {
        primary: "bg-primary text-white border-transparent hover:bg-primary-hover",
        outline: "bg-transparent text-primary border-primary hover:bg-primary-light",
        danger: "bg-danger text-white border-transparent hover:bg-danger-hover"
    };

    return (
        <button 
            className={`${baseClasses} ${variants[variant] || variants.primary}`}
            onClick={onClick}
            type={type}
        >
            {text}
        </button>
    )
}