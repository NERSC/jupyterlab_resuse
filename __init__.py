def mem_limit_calculator(rss, total_mem, used_mem, cpu_percent, num_users):
    if num_users > 0:
        targetPctFraction = 1/num_users
    else:
        targetPctFraction = 1
    return targetPctFraction * total_mem
