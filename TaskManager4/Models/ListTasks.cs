using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;

namespace TaskManager4.Models
{
    public class ListTasks
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdListTasks { get; set; }
        //[ForeignKey("ApplicationUser")]
        public string UserId { get; set; }
        [ForeignKey("Task")]
        public int IdTask { get; set; }

        public virtual ApplicationUser User { get; set; }
        public virtual Task Task { get; set; }
    }
}