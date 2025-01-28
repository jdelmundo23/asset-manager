function Dashboard() {
  const signOut = () => {
    window.location.href = "http://localhost:5000/auth/signout";
  };

  return (
    <div className="h-[100px] w-[300px] rounded-md border border-white">
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default Dashboard;
