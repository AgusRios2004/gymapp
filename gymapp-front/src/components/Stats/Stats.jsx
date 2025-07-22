import styles from './Stats.module.css'

const Stats = ({ stats }) => {
  return (
    <div className={styles.stats}>
      {stats.map((stat, index) => (
        <div key={index} className={styles.stat}>
          {stat.label}: {stat.value}
        </div>
      ))}
    </div>
  )
}

export default Stats