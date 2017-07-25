using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Entity;


namespace TaskManager4.Models
{
    public class Task
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int IdTask { get; set; }

        [Column(TypeName = "VARCHAR")]
        [StringLength(250)]
        public string Title { get; set; }
        [Required]
        public string Context { get; set; }
        public DateTime LastModification { get; set; }
    }
}