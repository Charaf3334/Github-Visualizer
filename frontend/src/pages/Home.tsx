import Navbar from '../components/Navbar'

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <div className="kadwa-regular flex flex-col items-center justify-center text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 w-full max-w-2xl">
          <h1 className="text-white text-5xl md:text-6xl font-bold leading-tight">
            Visualize Your Github Account
          </h1>
          <p className="text-gray-400 text-lg md:text-xl mt-2">
            All your Github stats and top projects, made simple!
          </p>
          <div className="flex w-full mt-15 border-2 border-white/30 rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 shadow-2xl">
            <input
              type="text"
              placeholder="Enter your Github Username"
              className="flex-1 px-5 py-3 text-white text-base md:text-lg placeholder:text-gray-400 outline-none bg-transparent"
            />
            <button className="px-5 py-3 bg-white/30 hover:bg-white/35 transition-colors duration-300 text-white flex items-center justify-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 md:h-6 md:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                />
              </svg>
            </button>
          </div>
        </div>
    </div>
  )
}

export default Home
