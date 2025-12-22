export default function SummaryCard({ number, label }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center w-60 transform hover:scale-105 transition-transform duration-300">
            <h2 className="text-5xl font-bold text-primary">{number ?? '...'}</h2>
            <p className="text-gray-500 mt-2 text-lg font-semibold">{label}</p>
        </div>
    )
}