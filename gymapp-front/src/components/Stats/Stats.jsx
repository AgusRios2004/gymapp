const Stats = ({ stats }) => {
  return (
    <div className="flex justify-center gap-4 bg-gray-100 p-4 rounded-lg w-full">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white py-2 px-5 rounded-md shadow-sm font-medium text-center">
          <span className="font-bold text-lg text-primary">{stat.value}</span> <span className="text-gray-600">{stat.label}</span>
        </div>
      ))}
    </div>
  )
}

export default Stats