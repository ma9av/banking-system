import HeaderBox from "@/components/HeaderBox"
import RightSideBar from "@/components/RightSideBar"
import TotalBalanceBox from "@/components/TotalBalanceBox"
import { log } from "util"

const Home = () => {
    const loggenInUser = { firstName: 'Manav', lastName: 'Panchal', email: 'manavpanchal42@gmail.com' }

  return (
    <section className="home">
        <div className="home-content">
            <header className="home-header">
                <HeaderBox type = "greeting" title = "Welcome" user = {loggenInUser?.firstName || 'Guest'}
                subtext = "Access and Manage your account and transactions efficiently" />

                <TotalBalanceBox accounts = {[]} totalBanks = {1} totalCurrentBalance = {12500.30}/>

            </header>
            RECENT TRANSACTIONS
        </div>
        <RightSideBar user={loggenInUser} transactions={[]} banks={[{},{}]}/>
    </section>
  )
}

export default Home
